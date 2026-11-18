import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import NewHeader from "../../components/ui/admin/newHeader";
import AdminFooter from "./Footer";

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-hairline last:border-0">
    <dt className="w-40 note text-bark">{label}</dt>
    <dd className="font-medium text-ink break-all">{value || "—"}</dd>
  </div>
);

const Profile = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <NewHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="display-2 mb-6 text-ink">Store Profile</h1>
        <section className="bg-paper border-t-2 border-ink p-6">
          <div className="flex items-center gap-4 mb-6">
            {user?.brand_logo ? (
              <img src={user.brand_logo} alt={`${user.brand_name} logo`} className="w-16 h-16 object-contain border border-hairline bg-paper" />
            ) : (
              <div className="w-16 h-16 bg-parchment border border-hairline" aria-hidden="true" />
            )}
            <div>
              <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink">{user?.brand_name}</p>
              <p className="note text-bark">Seller account</p>
            </div>
          </div>
          <dl>
            <Row label="Owner" value={user?.name} />
            <Row label="Email" value={user?.email} />
          </dl>
        </section>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/store/products" className="btn-ink !px-5 !py-2">Manage products</Link>
          <Link to="/store/order" className="px-5 py-2 border border-hairline font-medium hover:border-ink/40 transition-colors">View orders</Link>
          <Link to="/forgot-password" className="px-5 py-2 border border-hairline font-medium hover:border-ink/40 transition-colors">Change password</Link>
        </div>
      </main>
      <AdminFooter />
    </div>
  );
};

export default Profile;
