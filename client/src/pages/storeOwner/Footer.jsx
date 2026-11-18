const AdminFooter = ()=>{
    return (
        <footer className="bg-paper border-t border-hairline text-center lg:text-left mt-10">
            <div className="text-bark text-center p-4 note">
                © {new Date().getFullYear()}
                <span className="text-ink font-semibold font-display font-semibold tracking-[-0.02em]"> MONOFIT</span>
            </div>
        </footer>
    );
}
export default AdminFooter;