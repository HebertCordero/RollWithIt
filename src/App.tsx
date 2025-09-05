import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import DiceRoller from './pages/DiceRoller/DiceRoller';
import ActionScreen from './pages/ActionScreen/ActionScreen';
import './App.css';

function App() {
  return (
    <Router>
        <div className='app'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<DiceRoller  />} />
            <Route path="/diceroller" element={<DiceRoller />} />
            <Route path="/actionScreen" element={<ActionScreen />} />
          </Routes>
        </div>
    </Router>
  )
}

export default App
