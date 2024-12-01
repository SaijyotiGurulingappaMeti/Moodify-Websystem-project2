import React from 'react'
import { BounceLoader } from 'react-spinners'

const Loader = () => {
  return (
    <div
    className="text-center"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <BounceLoader color="red" />
  </div>
  )
}

export default Loader
