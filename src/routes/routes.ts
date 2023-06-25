/**
 * @file src/routes/routes.ts
 * @summary Defines the application routes
 * @modules Routes
 */

import express, { Router } from 'express';
import LeagueService from '../services/services';
import LeagueController from '../services/leagueController';

const router : Router = express.Router();

/**
 * Creates and configures the router for handling application routes
 * @param {LeagueService} leagueService The league service instance for handling league-related operations
 * @param {LeagueController} leagueController The league controller instance for handling route callbacks
 * @returns {Router} The configured router for handling application routes
 */
export default function routes( leagueService: LeagueService, leagueController: LeagueController ): Router {

  // Create a new league
  router.post('/leagues', leagueController.createLeague(leagueService))
  // Get users from a league
  router.get('/leagues/:leagueId/users', leagueController.getUsersFromLeague(leagueService))
  // Update a team
  router.patch('/teams/:teamId', leagueController.updateTeamName(leagueService))

  return router
}
