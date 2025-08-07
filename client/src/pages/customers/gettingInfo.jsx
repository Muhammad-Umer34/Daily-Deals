import { useSelector } from "react-redux";
import { useState } from "react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";

import { updateUserInfo } from "../../features/customer/customerApi";
import { authActions } from "../../features/auth/authSlices";
import EditInfo from "./editInfo";
import AddAddress from "./addNewAdress";

const GetOrShowInfo = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [editForm, setEditForm] = useState(false);
  const [addAddressForm , setAddAddressForm] = useState(false);
  console.log("user:", user);


  const showForm = !(
    user?.address && 
    user.address.length > 0 && 
    user?.phoneNumber && 
    user.phoneNumber.length > 0
  );

  console.log("showForm:", showForm);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
  });

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
        const updatedUser = {
          ...user,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          name: formData.fullName,
          email: formData.email,
        };
        
        await updateUserInfo(updatedUser, accessToken);
        dispatch(authActions.updateUser(updatedUser));
        alert("Profile updated successfully!");
        
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    } else {
      console.error("User not found");
      alert("User session not found. Please login again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-12 bg-white shadow-xl rounded-xl border border-gray-100 relative">
       {addAddressForm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-100 shadow-lg" style={{zIndex: 100}}>
          <div className="max-w-xl w-full max-h-screen overflow-y-auto">
            <AddAddress setAddAddressForm={setAddAddressForm} />
          </div>
        </div>
      )}
      {editForm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-100" style={{zIndex: 100}}>
          <div className="max-w-xl w-full max-h-screen overflow-y-auto">
            <EditInfo onClose={() => setEditForm(false)} />
          </div>
        </div>
      )}
      {showForm ? (
        <div className="space-y-8">
          <div className="text-center pb-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Please fill in the missing information to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="03333333333"
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Shipping Address
              </label>
              <textarea
                name="address"
                id="address"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete shipping address"
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Complete Profile
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center pb-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Profile Information
            </h2>
            <p className="text-gray-600">
              Manage your account details and preferences
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Personal Information
              </h3>
              <button 
                onClick={() => setEditForm(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
              >
                <FaEdit className="text-sm" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                  Full Name
                </h4>
                <p className="text-gray-900 text-lg font-medium">
                  {user?.name || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                  Email
                </h4>
                <p className="text-gray-900 text-lg font-medium">
                  {user?.email || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                  Phone Number
                </h4>
                <p className="text-gray-900 text-lg font-medium">
                  {user?.phoneNumber || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                  Member Since
                </h4>
                <p className="text-gray-900 text-lg font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Shipping Address
              </h3>
              <button 
                onClick={()=>{ setAddAddressForm(true)}}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
              >
                <FaPlus className="text-sm" />
                Add Address
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              {user?.address ? (
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                    Primary Address
                  </h4>
                  <p className="text-gray-900 text-base leading-relaxed">
                    {user.address}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <FaPlus className="text-2xl mx-auto mb-2 opacity-50" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No shipping address added yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Add an address to enable shipping
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetOrShowInfo;