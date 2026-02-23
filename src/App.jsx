import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Borrower from './pages/Borrower';
import Lender from './pages/Lender';
import Admin from './pages/Admin';
import Chat from './pages/Chat';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Profile from './pages/Profile';
import LoadingSplash from './pages/onboarding/LoadingSplash';
import LocationSetup from './pages/onboarding/LocationSetup';
import ProfileSetup from './pages/onboarding/ProfileSetup';
import KycScreen from './pages/onboarding/KycScreen';
import RequestForm from './pages/RequestForm';
import CollateralPayment from './pages/CollateralPayment';
import RentalPayment from './pages/RentalPayment';
import ActiveTimer from './pages/ActiveTimer';
import PreHandover from './pages/PreHandover';
import PostReturn from './pages/PostReturn';
import LenderWaiting from './pages/LenderWaiting';
import BorrowerWaiting from './pages/BorrowerWaiting';
import Chatbot from './components/Chatbot';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isOnboarding = location.pathname.startsWith('/onboarding');

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <main className="flex-grow w-full max-w-md mx-auto bg-white shadow-xl relative mt-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding/splash" replace />} />

            {/* Onboarding Routes */}
            <Route path="/onboarding/splash" element={<LoadingSplash />} />
            <Route path="/onboarding/location" element={<LocationSetup />} />
            <Route path="/onboarding/profile" element={<ProfileSetup />} />
            <Route path="/onboarding/kyc" element={<KycScreen />} />

            {/* Main App Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/borrower" element={<Borrower />} />
            <Route path="/lender" element={<Lender />} />
            <Route path="/profile" element={<Profile />} />

            {/* Secondary Flow Routes */}
            <Route path="/borrower/waiting/:status/:id" element={<BorrowerWaiting />} />
            <Route path="/request/new" element={<RequestForm />} />
            <Route path="/payment/collateral/:id" element={<CollateralPayment />} />
            <Route path="/payment/rental/:id" element={<RentalPayment />} />
            <Route path="/active/:id" element={<ActiveTimer />} />
            <Route path="/lender/pre-handover/:id" element={<PreHandover />} />
            <Route path="/lender/post-return/:id" element={<PostReturn />} />
            <Route path="/lender/waiting/:id" element={<LenderWaiting />} />

            {/* Hidden / Demo Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
        {!isOnboarding && <BottomNav />}
        {!isOnboarding && <Chatbot />}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
