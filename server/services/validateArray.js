exports.validateInputs = (json, validInputs) => {
  return new Promise((resolve, reject) => {
    let errorList = [];
    let reqInputs = validInputs.filter(i => i.required === true)
    let c = 0;
    for (let line of json) {
      for (let input of validInputs) {
        // check required inputs for empty strings, null or undefined
        if (!line[input.value] && input.required === true) {
          errorList.push(`Required Input "${input.value}" on line ${c + 1} is invalid`)
          reject({
            errorType: 'error',
            errorHeader: 'Please fix the errors and upload the file again',
            errorList,
          });
        }
        // check numbers for NaNs
        if (input.type === 'number') {
          if (!Number.isInteger(parseInt(line[input.value])) && line[input.value] !== undefined) {
            errorList.push(`Number Input "${line[input.value]}" on line ${c + 1} must be a valid whole number`)
            reject({
              errorType: 'error',
              errorHeader: 'Please fix the errors and upload the file again',
              errorList,
            });
          }
        }
        //check inputs valid Values if it's a controlled value
        if (input.type === 'controlled' && !input.validValues.includes(line[input.value])) {
          errorList.push(`Invalid Input "${line[input.value]}" on line ${c + 1} is not a valid ${input.value}`)
          reject({
            errorType: 'error',
            errorHeader: 'Please fix the errors and upload the file again',
            errorList,
          });
        }
      }
      c++
    }
    resolve({
      isValid: true,
    })
  })
}

exports.validateHeaders = (json, headers) => {
  return new Promise((resolve, reject) => {
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