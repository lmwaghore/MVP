import React from "react";

const Canvas = ({squareArr, update, adder}) => {
  return (
    <div id="canvas" ref={update} onClick={()=> {
      adder()
    }}/>
  )
}

export default Canvas;