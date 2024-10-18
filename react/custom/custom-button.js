import React from 'react';

export default function CustomButton({ label, onClick}) {
  const style =  {backgroundColor: isClicked ? 'blue' : 'grey', color: isClicked ? 'white' : 'black', padding: '10px', margin: '2px'}
  return (
    <button onClick={onClick} style={style}>
      {label}
    </button>
  );
}


