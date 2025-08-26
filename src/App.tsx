import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import DiceRoller from './pages/DiceRoller/DiceRoller';
import ActionScreen from './pages/ActionScreen/ActionScreen';
import Inventory from './pages/Inventory/Inventory';
import './App.css';

function App() {
  return (
    <Router>
        <div className='app'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory  />} />
            <Route path="/diceroller" element={<DiceRoller />} />
            <Route path="/actionScreen" element={<ActionScreen />} />
          </Routes>
        </div>
    </Router>
  )
}

export default App
