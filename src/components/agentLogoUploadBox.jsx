import React from 'react';
import UploadIcon from '../icons/upload.svg';
import PropTypes from 'prop-types';

const AgentUploadBox = ({ imageUrl, handleClick, className, style }) => {
  return (
  <div className={`agent-upload-box ${className || ''}`} style={style} onClick={handleClick}>
  {imageUrl ? (
    // <img src={imageUrl} alt="Preview" className="preview-image" />
    <div className="agent-upload-text">Image Uploaded</div>
  ) : (
    <>
      {/* <img src={UploadIcon} alt="Upload Icon" className="upload-icon" /> */}
      <div className="agent-upload-text">Upload Image</div>
    </>
  )}
  </div>
  );
};

AgentUploadBox.propTypes = {
  imageUrl: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

AgentUploadBox.defaultProps = {
  imageUrl: undefined,
  className: '',
  style: {},
};

export default AgentUploadBox;