export function windSpeedToKmh(value_str){
  const unit = 'km/h'; // Declare unit with const
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = (value * 3.6).toFixed(2); // Convert m/s to km/h
  return {converted_value, unit};
};

export function windSpeedToKnots(value_str){
  const unit = 'knots';
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = (value * 1.943844).toFixed(1); // Convert m/s to knots
  return {converted_value, unit};
};


export function tempToDegreeF(value_str){
  const unit = 'degree_F';
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = Math.round((value * (9 / 5)) + 32); 
  return {converted_value, unit};
};

export function tempToDegreeC(value_str){
  const unit = 'degree_C';
  //const value= parseFloat(value_str); // Convert string to float
  const converted_value = Math.round(parseFloat(value_str)); 
  return {converted_value, unit};
};

export function pressureToKPa(value_str){
  const unit = 'kPa';
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = (value * 0.1).toFixed(1); 
  return {converted_value, unit};
};

export function pressureToInHg(value_str){
  const unit = 'inHg';
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = (value * 0.02953).toFixed(1); 
  return {converted_value, unit};
};

export function windHeightToFt(value_str){
  const unit = 'ft';
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = (value * 3.28084).toFixed(1); 
  return {converted_value, unit};
};

export function windHeightToM(value_str){
  const unit = 'm';
  const value= parseFloat(value_str); // Convert string to float
  const converted_value = parseFloat(value).toFixed(1); 
  return {converted_value, unit};
};



