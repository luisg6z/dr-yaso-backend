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
import observationsRouter from './observations/observations.router'

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
router.use('/observations', observationsRouter)

export default router
