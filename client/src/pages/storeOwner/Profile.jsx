import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import NewHeader from "../../components/ui/admin/newHeader";
import AdminFooter from "./Footer";

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <dt className="w-40 text-sm text-gray-500">{label}</dt>
    <dd className="font-medium text-gray-900 break-all">{value || "—"}</dd>
  </div>
);

const Profile = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NewHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Store Profile</h1>
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            {user?.brand_logo ? (
              <img src={user.brand_logo} alt={`${user.brand_name} logo`} className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-white" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100" aria-hidden="true" />
            )}
            <div>
              <p className="text-xl font-semibold">{user?.brand_name}</p>
              <p className="text-sm text-gray-500">Seller account</p>
            </div>
          </div>
          <dl>
            <Row label="Owner" value={user?.name} />
            <Row label="Email" value={user?.email} />
          </dl>
        </section>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/store/products" className="px-4 py-2 rounded-lg bg-black text-white font-medium">Manage products</Link>
          <Link to="/store/order" className="px-4 py-2 rounded-lg border border-gray-300 font-medium">View orders</Link>
          <Link to="/forgot-password" className="px-4 py-2 rounded-lg border border-gray-300 font-medium">Change password</Link>
        </div>
      </main>
      <AdminFooter />
    </div>
  );
};

export default Profile;
