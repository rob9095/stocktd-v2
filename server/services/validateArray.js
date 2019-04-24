const validateInputs = (json, validInputs) => {
  return new Promise((resolve, reject) => {
    let errorList = [];
    let reqInputs = validInputs.filter(i => i.required === true)
    let c = 0;
    for (let line of json) {
      for (let input of validInputs) {
        // check required inputs for empty strings
        if (line[input.value] === '' && input.required === true && input.type !== 'array') {
          errorList.push(`Invalid Input: "${input.value}" on line ${c + 1} is empty or missing`)
          reject({
            errorType: 'error',
            errorHeader: 'Please fix the errors and upload the file again',
            errorList,
          });
        }
        // check numbers for NaNs
        if (input.type === 'number') {
          if (!Number.isInteger(parseInt(line[input.value])) && line[input.value] !== undefined) {
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
          if (!input.validValues.includes(line[input.value])) {
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
  })
}

const validateHeaders = (json, headers) => {
  return new Promise((resolve, reject) => {
    let inputHeaders = Object.keys(json[0]).filter(iH => !iH.startsWith('field'))
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
        errorList,
      })
      return
    }
    if (warnings.length > 0) {
      console.log('the warnings are')
      console.log(warnings)
      resolve({
        errorType: 'warning',
        errorHeader: 'The following headers will be ignored',
        errorList: warnings,
      })
      return
    }
    resolve({
      isValid: true,
    })
  })
}