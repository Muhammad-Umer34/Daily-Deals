const AdminFooter = ()=>{
    return (
        <footer className="bg-white text-center lg:text-left mt-10">
            <div className="text-gray-700 text-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                © {new Date().getFullYear()}
                <span className="text-gray-800 font-semibold"> Daily Deals</span>
            </div>
        </footer>
    );
}
export default AdminFooter;