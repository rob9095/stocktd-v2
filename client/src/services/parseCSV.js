import { addError } from '../store/actions/errors';
const csvtojson=require("csvtojson");

export const validateInputs = (json, validInputs) => {
  return dispatch => {
    return new Promise((resolve,reject) => {
      try {
        let errorList = [];
        let reqInputs = validInputs.filter(i => i.required === true)
        let c = 0;
        for (let line of json) {
          for (let input of validInputs) {
            // check required inputs for empty strings
            if (!line[input.value] && input.required === true) {
              errorList.push(`Invalid Input: "${input.value}" on line ${c + 1} is empty or missing`)
              reject({
                errorType: 'error',
                errorHeader: 'Please fix the errors and upload the file again',
                errorList,
              });
            }
            // check numbers for NaNs
            if (input.type === 'number') {
              if (!Number.isInteger(parseInt(line[input.value])) && line[input.value]) {
                errorList.push(`Invalid Number: "${line[input.value]}" on line ${c + 1} is not a valid number`)
                reject({
                  errorType: 'error',
                  errorHeader: 'Please fix the errors and upload the file again',
                  errorList,
                });
              }
            }
            //check inputs valid Values if it's an array
            if (input.type === 'array' && line[input.value] !== undefined) {
              if (!input.validValues.includes(line[input.value].toLowerCase())) {
                errorList.push(`Invalid Input: "${line[input.value]}" on line ${c + 1} is not a valid ${input.value}`)
                reject({
                  errorType: 'error',
                  errorHeader: 'Please fix the errors and upload the file again',
                  errorList,
                });
              }
            }
          }
          c++
        }
        resolve({
          isValid: true,
        })
      } catch(err) {
        console.log(err)
      }
    })
  }

}

export const validatePOInputs = (json, validInputs) => {
  let errorList = [];
  return dispatch => {
    return new Promise((resolve,reject) => {
      json.forEach((poLine,i) => {
        if (!validInputs.type.includes(poLine['po type'])) {
          errorList.push(`PO Type on line ${i+1} "${poLine['po type']}" is not valid`)
        }
        if (poLine['po status']) {
          if (!validInputs.status.includes(poLine['po status'])) {
            errorList.push(`PO Status on line ${i+1} "${poLine['po status']}" is not valid`)
          }
        }
        if (validInputs.quantity.includes('number')) {
          if (!Number.isInteger(parseInt(poLine['quantity']))) {
            errorList.push(`Quantity on line ${i+1} "${poLine['quantity']}" is not a valid number`)
          }
        }
      })
      if (errorList.length === 0) {
        resolve({
          isValid: true,
        })
        return
      }
      reject({
        errorType: 'error',
        errorHeader: 'Please fix the errors and upload the file again',
        errorList,
      })
    })
  }
}

export const validateHeaders = (json, headers) => {
  return dispatch => {
    return new Promise((resolve,reject) => {
      try {
        headers = headers.map(h => ({ ...h, value: h.value.toLowerCase() }))
        let inputHeaders = Object.keys(json[0]).filter(iH => !iH.startsWith('field')).map(iH => typeof iH === 'string' && iH.toLowerCase())
        let reqHeaders = headers.filter(h => h.required === true)
        let warnings = [];
        for (let inputHeader of inputHeaders) {
          if (!headers.some(poH => poH.value === inputHeader)) {
            warnings.push(`Invalid Header: "${inputHeader}" will be ignored`)
          }
          headers.forEach(h => {
            if (h.required === true && h.value === inputHeader) {
              reqHeaders = reqHeaders.filter(rh => rh.value !== inputHeader)
            }
          })
        }
        if (reqHeaders.length > 0) {
          console.log('the missing headers are')
          console.log(reqHeaders)
          let errorList = reqHeaders.map(h => (
            `Missing Required Header: ${h.value}`
          ))
          reject({
            errorType: 'error',
            errorHeader: 'Please fix the errors and upload the file again',
            errorList: errorList || [],
          })
          return
        }
        if (warnings.length > 0) {
          console.log('the warnings are')
          console.log(warnings)
          resolve({
            errorType: 'warning',
            errorHeader: 'The following headers will be ignored',
            errorList: warnings || [],
          })
          return
        }
        resolve({
          isValid: true,
        })
      } catch(err) {
        console.log(err)
      }
    })
  }
}

export const parseCSV = (event) => {
  return dispatch => {
    return new Promise((resolve,reject) => {
      // Check for File API support.
      if (!window.FileReader) {
        reject({
          errorType: 'error',
          errorHeader: 'Please use a different browser',
          errorList: ['File reader not supported in browser'],
        });
      }
      if (!event.target.files[0].name.endsWith('.csv')) {
        reject({
          errorType: 'error',
          errorHeader: 'Invalid File Format',
          errorList: ['The imported file is not a .csv'],
        });
      }
      const reader = new FileReader();
      reader.readAsText(event.target.files[0]);
      reader.onload = async (e) => {
        let raw = await csvtojson().fromString(e.target.result)
        let json = raw.map((po)=>(Object.keys(po).reduce((c, k) => (c[k.toLowerCase()] = po[k], c), {})))
        let jsonLowerCase = await csvtojson().fromString(e.target.result.toLowerCase())
        resolve({json, jsonLowerCase})
      }
      reader.onerror = (err) => {
        addError(err)
        reject(err)
      }
    })
  }
}
