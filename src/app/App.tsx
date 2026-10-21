import {useEffect} from 'react';
import {Routes,Route,useLocation,Navigate} from 'react-router-dom';
import {Header,PageLayout,Stepper,Notice} from '../ds';
import {useBooking} from '../features/booking/BookingContext';
import {isConfigured} from '../api/client';
import {Catalog} from './ds-catalog/Catalog';
import {ModelSelect} from './pages/ModelSelect';
import {DealerSelect} from './pages/DealerSelect';
import {InfoInput} from './pages/InfoInput';
import {Confirm} from './pages/Confirm';
import {Complete} from './pages/Complete';
const paths=['/','/dealers','/information','/confirm','/complete'];
export function App(){const location=useLocation();const {booking}=useBooking();const step=Math.max(1,paths.indexOf(location.pathname)+1);const catalog=location.pathname==='/ds';useEffect(()=>{window.scrollTo(0,0);document.title=catalog?'LUMIÈRE DS':`試乗お申し込み ${step}/5 | LUMIÈRE`;document.querySelector<HTMLElement>('#main-heading')?.focus()},[location.pathname,step,catalog]);return <><a href="#main" className="ds-sr-only ds-skip">本文へ移動</a><Header/><PageLayout id="main">{!catalog&&<><h1 id="main-heading" tabIndex={-1} className="ds-title">試乗お申し込み</h1>{(!isConfigured()||booking.offline)&&<Notice>オフラインデータで表示中</Notice>}<Stepper step={step}/></>}<Routes><Route path="/ds" element={<Catalog/>}/><Route path="/" element={<ModelSelect/>}/><Route path="/dealers" element={booking.model?<DealerSelect/>:<Navigate to="/" replace/>}/><Route path="/information" element={booking.vehicle?<InfoInput/>:<Navigate to="/dealers" replace/>}/><Route path="/confirm" element={booking.vehicle&&booking.info.name?<Confirm/>:<Navigate to="/information" replace/>}/><Route path="/complete" element={booking.receipt?<Complete/>:<Navigate to="/" replace/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></PageLayout><footer className="ds-footer">LUMIÈRE — デモ用の架空サイトです</footer></>}
