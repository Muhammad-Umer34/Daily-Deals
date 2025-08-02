import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { userProductActions } from "../../features/customer/productsSlice";

export function PaginationDemo() {
  const disptach = useDispatch();
  const activePage = useSelector((state) => state.userProducts.pageNo);
  const filteredProducts = useSelector((state) => state.userProducts.FilteredProducts);
  const len = Math.ceil(filteredProducts.length / 8);
  const handleOnClickOfPagination = (index)=>
  {
     console.log("Index is : ",index);
     disptach(userProductActions.setPageNo(index));
  }

  return (
    <Pagination className = "w-[100%]">
      <PaginationContent className = "w-[100%] flex justify-between">
      <div>
          <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        
      </div>
        <div className="flex gap-2">
          
        {[...Array(len)].map((_, i) => (
          <PaginationItem key={i} onClick={()=> {handleOnClickOfPagination(i+1)}}>
            <PaginationLink href="#" isActive={i + 1 === activePage} className={i + 1 === activePage ? "bg-black text-white" : ""}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {len > 3 && <PaginationEllipsis />}
        </div>

        <div>
          <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  );
}
