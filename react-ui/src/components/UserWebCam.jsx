import React, { useState } from 'react'
import Webcam from 'react-webcam'
import Button from '@mui/material/Button';
import { PhotoCamera,CloudUpload,CloseTwoTone,ReplayCircleFilled,Check } from "@mui/icons-material";
const videoConstraints = {
  width: 1080,
  height: 720,
  facingMode: 'user',
}
const UserWebCam = (props) => {
  const [picture, setPicture] = useState('')
  const webcamRef = React.useRef(null)
  const capture = React.useCallback(async() => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc)
    let temp = [...props.images];
    temp[props.index] = pictureSrc;
    props.setImages(temp);
  })
  return (
    <div>
      <div style={{textAlign:"center"}}>
        {picture === '' ? (
          <Webcam
            audio={false}
             height="75%"
            ref={webcamRef}
            width="75%"
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
        ) : (
          <img src={picture} alt=""/>
        )}
      </div>
      <div style={{textAlign:"center"}}>
        {picture !== '' ? (
          <Button
            color="primary"
            onClick={(e) => {
              e.preventDefault()
              setPicture('')
            }}
          >
            <ReplayCircleFilled />
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.preventDefault()
              capture()
            }}
            color="error"
          >
            <PhotoCamera/>
          </Button>
        )}

            <Button  color="warning" component="label">
              <CloudUpload/>
            <input type="file" accept="image/*" onChange={(e)=>{props.handleUpload(e,props.index)}} hidden/>
            </Button>
            {picture ==='' ?
            <Button  color="info" onClick={()=>{props.close()}}>
              <CloseTwoTone/>
            </Button> : <Button  color="success" onClick={()=>{props.close()}}>
              <Check/>
            </Button> }
      </div>
      <div>
          
      </div>  
    </div>
  )
}
export default UserWebCam