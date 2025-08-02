import { useSelector } from "react-redux"
const ProfileForm = ()=>{
const user = useSelector((state)=>state.auth.user);
const accessToken = useSelector((state) => state.auth.accessToken);
return (
  
)
}
export default ProfileForm;