export function validateData(data) {
  console.log(data);
  const dataFlag = new validateDTO();
  for (const property in data) {
    try {
      if (data[property] === undefined) {
        dataFlag.isValid = false;
        dataFlag.key = property;
        dataFlag.value = data[property];
        return dataFlag;
      } else if (
        data[property]?.toString() !== 'NULL' &&
        data[property]?.toString() !== 'NaN'
      ) {
        if (data[property].toString().length === 0) {
          dataFlag.isValid = false;
          dataFlag.key = property;
          dataFlag.value = data[property].toString();
          return dataFlag;
        } else {
          dataFlag.isValid = true;
        }
      } else {
        dataFlag.isValid = false;
        dataFlag.key = property;
        if (data[property].toString() === 'NaN') {
          dataFlag.value = '';
        } else {
          dataFlag.value = data[property]?.toString();
        }
        return dataFlag;
      }
    } catch (err) {
      console.log(err);
      dataFlag.isValid = false;
      return dataFlag;
    }
  }
  return dataFlag;
}
const allowdProp = ['email', 'address', 'suburb', 'postalCode'];
export function validateFacilities(data) {
  const dataFlag = new validateDTO();
  for (const property in data) {
    try {
      if (data[property].toString() !== 'NULL') {
        if (data[property].toString().length === 0) {
          dataFlag.isValid = false;
          dataFlag.key = property;
          dataFlag.value = data[property].toString();
          return dataFlag;
        } else {
          dataFlag.isValid = true;
        }
      } else {
        if (allowdProp.some((x) => x == property)) {
          dataFlag.isValid = true;
          data[property] = '';
        } else {
          dataFlag.isValid = false;
          dataFlag.key = property;
          dataFlag.value = data[property].toString();
          return dataFlag;
        }
      }
    } catch (err) {
      dataFlag.isValid = false;
      return dataFlag;
    }
  }
  return dataFlag;
}

export class validateDTO {
  isValid: boolean;
  key: string;
  value: string;
}
