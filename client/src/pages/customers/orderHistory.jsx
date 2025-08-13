import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { BiSearch } from 'react-icons/bi';
import { useState } from "react";
import { useEffect } from "react";

import { navActions } from "../../features/customer/navSlice";
import { getAllOrders } from "../../features/customer/customerApi";
import HistoryCard from "./orderHistoryCard";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const active = useSelector((state) => state.navActive.viewOrders);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(()=>{
    const fectchOrders = async()=>{
      try{
        const response = await getAllOrders(accessToken,user.id);
        setOrders(response);
        console.log("Received data : " , response);
      }
      catch(error){
        console.log(error);
        throw error;
      }
    }
    fectchOrders();
  },[user,accessToken])
  return (
    <div className="h-[100%] w-[100%] mt-8 m-12 ">
      <div className="ml-60 mr-60">
        <div>
          <h1 className="text-black text-2xl font-bold j">Order History</h1>
        </div>
        <div className="mt-4 flex gap-4 font-semibold mb-2 justify-between">
          <div className="flex gap-4 font-semibold">
            <div
            className={`border pl-2 pr-2 rounded-4xl text-center cursor-pointer ${
              active === "All" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={()=>{dispatch(navActions.setViewOrders("All"))}}
          >
            All
          </div>
          <div
            className={`border pl-2 pr-2 rounded-4xl text-center cursor-pointer ${
              active === " Delivered" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={()=>{dispatch(navActions.setViewOrders(" Delivered"))}}
          >
            Delivered
          </div>
          <div
            className={`border pl-2 pr-2 rounded-4xl text-center cursor-pointer ${
              active === "Processing" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={()=>{dispatch(navActions.setViewOrders("Processing"))}}
          >
            Processing
          </div>
          <div
            className={`border pl-2 pr-2 rounded-4xl text-center cursor-pointer ${
              active === "Returned" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={()=>{dispatch(navActions.setViewOrders("Returned"))}}
          >
            Returned
          </div>
          </div>
          <div>
            <div className="relative hidden sm:block">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="border border-gray-300 rounded-full pl-4 pr-8 py-1 text-sm 
                         focus:outline-none focus:border-blue-500 focus:shadow-md 
                         transition-all duration-300 w-32 focus:w-52"
                      />
                      <BiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
          </div>
        </div>
        <div>
           {
            orders.map((order)=>{
              return <HistoryCard order={order}/>
            })
           }
        </div>
      </div>
    </div>
  );
};
export default OrderHistory;
