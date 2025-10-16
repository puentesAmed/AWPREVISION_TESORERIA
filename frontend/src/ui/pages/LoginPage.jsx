import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../state/auth.js'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Box, Button, Input, useColorModeValue } from '@chakra-ui/react'




const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
export function LoginPage(){
  const bg = useColorModeValue('white','neutral.800')
  const border = useColorModeValue('neutral.200','neutral.700')
  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm({ resolver: zodResolver(schema)})
  const { login } = useAuth(); const nav = useNavigate(); const loc = useLocation()
  const onSubmit = async (data)=>{
    const { data: r } = await api.post('/auth/login', data); login(r.user, r.token)
    login({ id:'1', email:data.email, name:'Usuario', role:'fin' }, 'dummy') // sustituye al conectar backend
    nav((loc.state?.from?.pathname)||'/dashboard', { replace:true })
  }
  return (
    <Box maxW="420px" mx="auto" mt={8} p={6} bg={bg} border="1px solid" borderColor={border} rounded="lg">
      <div className="container" style={{maxWidth:420}}>
        <div className="card"><h2>Iniciar sesión</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid">
            <div><label>Email</label><input className="input" type="email" {...register('email')}/>{errors.email&&<small style={{color:'var(--color-danger)'}}>{errors.email.message}</small>}</div>
            <div><label>Contraseña</label><input className="input" type="password" {...register('password')}/>{errors.password&&<small style={{color:'var(--color-danger)'}}>{errors.password.message}</small>}</div>
            <button className="btn" disabled={isSubmitting}>{isSubmitting? 'Accediendo':'Entrar'}</button>
          </form>
        </div>
      </div>
    </Box>
  )
}
