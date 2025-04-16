import { NavbarDemo } from "@/components/navbar";
import Footer from "../components/footer";
const LicenseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <NavbarDemo>
            {children}
            <Footer />
        </NavbarDemo>
    </div>
  );
};

export default LicenseLayout;