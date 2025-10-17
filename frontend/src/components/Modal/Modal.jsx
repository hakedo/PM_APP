import PropTypes from 'prop-types';

function Modal({ isOpen, onClose, onSubmit, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[500px] relative shadow-lg">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          ×
        </button>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default Modal;