import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Logout() {

  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const handleLogout = async () => {
      await logout()
      navigate("/")
    }
    handleLogout()
  }, [logout, navigate])

  return null
}
