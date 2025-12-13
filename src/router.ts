import { Router } from 'express'
import franchiseRouter from './franchises/franchises.router'
import volunteersRouter from './volunteers/volunteer.router'
import usersRouter from './users/users.router'
import occupationRouter from './occupations/occupations.router'
import locationRouter from './locations/locations.router'
import visitsRouter from './visits/visits.router'
import authRouter from './auth/auth.router'
import meetingsRouter from './meetings/meetings.router'
import StateRouter from './states/states.router'
import CountryRouter from './countries/country.router'
import CityRouter from './cities/cities.router'
import banksRouter from './banks/banks.router'
import pettyCashRouter from './petty-cash/petty-cash.router'
import bankAccountsRouter from './bank-accounts/bank-accounts.router'
import cashMovementsRouter from './cash-movements/cash-movements.router'
import accountMovementsRouter from './account-movements/account-movements.router'

const router = Router()

router.use('/auth', authRouter)
router.use('/franchises', franchiseRouter)
router.use('/volunteers', volunteersRouter)
router.use('/users', usersRouter)
router.use('/occupations', occupationRouter)
router.use('/locations', locationRouter)
router.use('/visits', visitsRouter)
router.use('/meetings', meetingsRouter)
router.use('/states', StateRouter)
router.use('/countries', CountryRouter)
router.use('/cities', CityRouter)
router.use('/banks', banksRouter)
router.use('/petty-cash', pettyCashRouter)
router.use('/bank-accounts', bankAccountsRouter)
router.use('/cash-movements', cashMovementsRouter)
router.use('/account-movements', accountMovementsRouter)

export default router
