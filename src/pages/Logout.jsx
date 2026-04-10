import { useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { alertConfirm } from "../utilitis/alert"

export default function Logout() {

  const navigate = useNavigate()
  const { logout } = useAuth()
  const hasPromptedRef = useRef(false)

  useEffect(() => {
    if (hasPromptedRef.current) return
    hasPromptedRef.current = true

    const handleLogout = async () => {
      const result = await alertConfirm('Apakah Anda yakin ingin keluar dari aplikasi?')
      if (!result.isConfirmed) {
        navigate(-1)
        return
      }
      await logout()
      navigate("/")
    }
    handleLogout()
  }, [logout, navigate])

  return null
}
