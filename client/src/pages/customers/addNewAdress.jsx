import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { updateUserInfo } from "../../features/customer/customerApi";
import { useDispatch } from "react-redux";
import { authActions } from "../../features/auth/authSlices";

const AddAddress = ({setAddAddressForm}) => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!user) return;

    const newAddress = String(data.addAddress).trim();
     let addressList = [...(user.address || [])]; 


    if (data.defaultAddress) {
      addressList.unshift(newAddress);
    } else {
      addressList.push(newAddress);
    }

    const updatedUser = { ...user, address: addressList };

    try {
      await updateUserInfo(updatedUser, accessToken);
      reset();
      setAddAddressForm(false);
      dispatch(authActions.updateUser(updatedUser));
    } catch (error) {
      console.error("❌ Failed to update user info:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded bg-white shadow-lg"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Add New Address</h1>
        <IoClose className="w-6 h-6 text-gray-700 cursor-pointer" onClick={()=>{setAddAddressForm(false)}}/>
      </div>

      <div>
        <label htmlFor="addAddress" className="block font-semibold mb-1">
          Add Address
        </label>
        <textarea
          id="addAddress"
          rows="3"
          className="border-2 border-gray-300 focus:border-black w-full p-2 rounded"
          {...register("addAddress", { required: "Address is required" })}
        ></textarea>
        {errors.addAddress && (
          <p className="text-red-500 text-sm mt-1">
            {errors.addAddress.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="defaultAddress" className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            id="defaultAddress"
            {...register("defaultAddress")}
          />
          Make this default address
        </label>
      </div>

      <div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AddAddress;
