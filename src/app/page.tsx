"use client"

import { useState, useEffect } from 'react'
import { Diamond, Bomb, Coins } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import AnimatedPrice from '@/components/AnimatedPrice'

const GRID_SIZE = 5
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE

const calculateProfit = (bet: number, mult: number) => {
  return bet * (mult - 1); // This calculates the profit, not the total payout
}

export default function MinesGame() {
  const [grid, setGrid] = useState<Array<'empty' | 'diamond' | 'mine'>>([])
  const [revealedCells, setRevealedCells] = useState<boolean[]>([])
  const [betAmount, setBetAmount] = useState<string>('0')
  const [minesCount, setMinesCount] = useState<string>('1')
  const [gemsCount, setGemsCount] = useState(24)
  const [multiplier, setMultiplier] = useState(1.08)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const { toast } = useToast()
  const [showCashoutAnimation, setShowCashoutAnimation] = useState(false)
  const [cashoutAmount, setCashoutAmount] = useState(0)
  const [miniGrid, setMiniGrid] = useState<Array<'empty' | 'mine'>>(Array(TOTAL_CELLS).fill('empty'))
  const [placedMines, setPlacedMines] = useState(0)
  const [profit, setProfit] = useState(0)
  const [betPlaced, setBetPlaced] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const handleBet = () => {
    const betValue = parseFloat(betAmount)
    if (isNaN(betValue) || betValue <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount greater than zero.",
        variant: "destructive",
      })
      return
    }

    // Check if mines are placed
    if (placedMines === 0) {
      toast({
        title: "No Mines Placed",
        description: "Please place mines on the grid before starting the game.",
        variant: "destructive",
      })
      return
    }

    // Check if correct number of mines is placed
    if (placedMines !== parseInt(minesCount)) {
      toast({
        title: "Incorrect Mine Count",
        description: `Please place exactly ${minesCount} mines before starting the game.`,
        variant: "destructive",
      })
      return
    }

    // If all checks pass, start the game
    initializeGame() // Reset the game
    setGameStarted(true)
    setBetPlaced(true)
    setProfit(0) // Reset profit to 0 when a new bet is placed
    toast({
      title: "Bet Placed",
      description: `Game started with a bet of ${betValue} coins.`,
      variant: "default",
    })
  }

  const handleCellClick = (index: number) => {
    if (!gameStarted || gameOver || gameWon || revealedCells[index]) return

    const newRevealedCells = [...revealedCells]
    newRevealedCells[index] = true
    setRevealedCells(newRevealedCells)

    if (grid[index] === 'mine') {
      setGameOver(true)
      setGameStarted(false)
      toast({
        title: "Game Over!",
        description: "You hit a mine. Better luck next time!",
        variant: "destructive",
      })
    } else {
      const newMultiplier = calculateMultiplier(newRevealedCells)
      setMultiplier(newMultiplier)
      
      // Update profit only when a diamond is revealed
      const betValue = parseFloat(betAmount)
      if (!isNaN(betValue) && betValue > 0) {
        setProfit(calculateProfit(betValue, newMultiplier))
      }

      if (newRevealedCells.filter(Boolean).length === TOTAL_CELLS - Number(minesCount)) {
        setGameWon(true)
        handleCashout()
      }
    }
  }

  const calculateMultiplier = (revealed: boolean[]) => {
    const revealedCount = revealed.filter(Boolean).length
    return 1 + (revealedCount * 0.2)
  }

  const handleCashout = () => {
    if (!gameStarted || gameOver) return

    const winAmount = calculateProfit(Number(betAmount), Number(multiplier));
    setShowCashoutAnimation(true)
    setCashoutAmount(winAmount)
    setGameWon(true)
    setGameStarted(false)

    toast({
      title: "Cashout Successful!",
      description: `You won ${winAmount.toFixed(2)} coins!`,
      variant: "default",
    })

    // Delay the game reset to allow for the animation
    setTimeout(() => {
      setShowCashoutAnimation(false)
      initializeGame()
    }, 3000) // 3 seconds delay
  }

  const handleMiniGridClick = (index: number) => {
    if (placedMines >= parseInt(minesCount)) {
      if (miniGrid[index] === 'mine') {
        const newMiniGrid = [...miniGrid]
        newMiniGrid[index] = 'empty'
        setMiniGrid(newMiniGrid)
        setPlacedMines(prev => prev - 1)
      } else {
        toast({
          title: "Maximum mines reached",
          description: "Remove a mine before placing a new one.",
          variant: "destructive",
        })
      }
    } else {
      const newMiniGrid = [...miniGrid]
      newMiniGrid[index] = miniGrid[index] === 'mine' ? 'empty' : 'mine'
      setMiniGrid(newMiniGrid)
      setPlacedMines(prev => miniGrid[index] === 'mine' ? prev - 1 : prev + 1)
    }
  }

  const handleBetAmountChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(value)
    } else if (value === '') {
      setBetAmount('')
    }
  }

  const initializeGame = () => {
    const newGrid = Array(TOTAL_CELLS).fill('empty')
    
    miniGrid.forEach((cell, index) => {
      if (cell === 'mine') {
        newGrid[index] = 'mine'
      }
    })
    
    // Fill remaining cells with diamonds
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (newGrid[i] === 'empty') {
        newGrid[i] = 'diamond'
      }
    }
    
    setGrid(newGrid)
    setRevealedCells(Array(TOTAL_CELLS).fill(false))
    setGameOver(false)
    setGameWon(false)
    setMultiplier(1.08)
    setGameStarted(false)
    setProfit(0)
    setBetPlaced(false)
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-900 p-4">
      <Card className="w-full max-w-4xl bg-slate-800 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Game Parameters */}
            <div className="w-full md:w-1/3 space-y-4">
              <div className="flex justify-between mb-4 bg-slate-700 rounded-full p-1">
                <Button variant="ghost" className="w-1/2 rounded-full bg-slate-600">Manual</Button>
                <Button variant="ghost" className="w-1/2 rounded-full">Auto</Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-400">Bet Amount</label>
                  <span className="text-sm font-medium text-slate-400">${parseFloat(betAmount).toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-700 rounded-md p-2">
                  <Input 
                    type="number" 
                    value={betAmount} 
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    className="bg-transparent border-none text-white"
                    step="0.01"
                    min="0.01"  // This prevents negative values
                  />
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setBetAmount((prev) => (parseFloat(prev) / 2).toString())}>½</Button>
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setBetAmount((prev) => (parseFloat(prev) * 2).toString())}>2×</Button>
                </div>
              </div>
              <div className="flex justify-between space-x-2">
                <div className="w-1/2">
                  <label className="text-sm font-medium text-slate-400">Mines</label>
                  <Input 
                    type="number" 
                    value={minesCount}
                    onChange={(e) => {
                      setMinesCount(e.target.value)
                      setMiniGrid(Array(TOTAL_CELLS).fill('empty'))
                      setPlacedMines(0)
                    }}
                    className="bg-slate-700 text-white border-slate-600 mt-1"
                    min="1"
                    max="24"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-sm font-medium text-slate-400">Gems</label>
                  <Input 
                    type="number" 
                    value={gemsCount}
                    onChange={(e) => setGemsCount(Number(e.target.value))}
                    className="bg-slate-700 text-white border-slate-600 mt-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-400">Total profit ({multiplier.toFixed(2)}x)</label>
                  <span className="text-sm font-medium text-slate-400">
                    {showCashoutAnimation ? (
                      <AnimatedPrice finalValue={cashoutAmount} duration={2000} />
                    ) : (
                      `$${profit.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-700 rounded-md p-2">
                  <Input 
                    type="text" 
                    value={showCashoutAnimation ? cashoutAmount.toFixed(2) : profit.toFixed(2)}
                    readOnly
                    className="bg-transparent border-none text-white"
                  />
                  <Coins className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 transition-colors"
                onClick={handleBet}
                disabled={gameStarted || parseFloat(betAmount) <= 0}
              >
                Bet
              </Button>
              <Button 
                className="w-full bg-slate-700 hover:bg-slate-600 transition-colors"
                onClick={() => {
                  if (gameStarted) {
                    const randomIndex = Math.floor(Math.random() * TOTAL_CELLS)
                    handleCellClick(randomIndex)
                  }
                }}
                disabled={!gameStarted || gameOver || gameWon}
              >
                Pick random tile
              </Button>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 transition-colors"
                onClick={handleCashout}
                disabled={!gameStarted || gameOver || gameWon}
              >
                Cashout
              </Button>
            </div>

            {/* Game Grid */}
            <div className="w-full md:w-2/3">
              <div className="grid grid-cols-5 gap-2">
                {grid.map((cell, index) => (
                  <Button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    className={`w-full h-20 rounded-md transition-all duration-300 
                      ${revealedCells[index] 
                        ? cell === 'mine' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-slate-700 hover:bg-slate-600' 
                        : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    disabled={!gameStarted || gameOver || gameWon || revealedCells[index]}
                  >
                    {revealedCells[index] && (
                      cell === 'mine' 
                        ? <Bomb className="w-10 h-10 text-red-300" />
                        : <Diamond className="w-10 h-10 text-green-400" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Grid for setting mines */}
      <div className="w-full md:w-1/3 mb-4 ml-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Set Mines</h3>
        <div className="grid grid-cols-5 gap-1">
          {miniGrid.map((cell, index) => (
            <Button
              key={index}
              onClick={() => handleMiniGridClick(index)}
              className={`w-full h-10 rounded-md transition-all duration-300 
                ${cell === 'mine' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-slate-700 hover:bg-slate-600'
                }`}
              disabled={gameStarted}
            >
              {cell === 'mine' && <Bomb className="w-6 h-6 text-white" />}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-sm text-white">Placed mines: {placedMines} / {minesCount}</p>
      </div>
    </div>
  )
}