import { useSelector } from "react-redux";
import { useState } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { updateUserInfo } from "../../features/customer/customerApi";
import { useDispatch } from "react-redux";
import { authActions } from "../../features/auth/authSlices";

const EditInfo = ({ onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phoneNumber: Array.isArray(user?.phoneNumber) 
      ? user.phoneNumber[0] || "" 
      : user?.phoneNumber || "",
    address: Array.isArray(user?.address) 
      ? user.address[0] || "" 
      : user?.address || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    
    if (!formData.fullName.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      alert("Please enter your email");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      alert("Please enter your phone number");
      return;
    }
    if (!formData.address.trim()) {
      alert("Please enter your address");
      return;
    }

    if (user) {
      try {
        setIsLoading(true);
        const updatedUser = {
          ...user,
          name: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        };
        
        await updateUserInfo(updatedUser, accessToken);
        dispatch(authActions.updateUser(updatedUser));
        alert("Profile updated successfully!");
        
        if (onClose) {
          onClose();
        }
        
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("User not found");
      alert("User session not found. Please login again.");
    }
  };

  return (
    <div className="w-full p-4 bg-white shadow-4xl rounded-lg border border-gray-200 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
        aria-label="Close"
      >
        <FaTimes className="text-sm" />
      </button>
      <div className="space-y-4">
        <div className="text-center pb-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Edit Profile
          </h2>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="03333333333"
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              id="address"
              rows="2"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white py-1.5 px-3 rounded text-xs font-medium hover:bg-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white py-1.5 px-3 rounded text-xs font-medium hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInfo;