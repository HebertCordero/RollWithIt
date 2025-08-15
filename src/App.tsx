import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import DiceRoller from './pages/DiceRoller/DiceRoller';
import './App.css'

function App() {
  return (
    <Router>
        <div className='app'>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/diceroller">DiceRoller</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/diceroller" element={<DiceRoller />} />
          </Routes>
        </div>
    </Router>
  )
}

export default App
