/**
 * @file src/services/services.ts
 * @summary Service for performing league-related operations
 * @module LeagueService
 */

import LeagueController from './leagueController.js'
import { QueryOptions, } from 'couchbase'

/**
 * Service class for performing league-related operations
 */
class LeagueService {
    private leagueController : LeagueController

    /**
     * Constructs a new instance of the LeagueService class
     * @param {LeagueController} leagueController - The league controller instance
     */
    constructor(leagueController: LeagueController) {
        this.leagueController = leagueController
    }

    /**
     * Creates a new league
     * @param {string} id - The ID of the league
     * @param {string} name - The name of the league
     * @param {string} description - The description of the league
     * @param {string} adminId - The ID of the admin user
     * @returns {Promise<any>} A promise that resolves to the result of the league creation
     */
    public async toCreateLeague(id: string, name: string, description: string, adminId: string) : Promise<any>{
        // Create a new league document
        const league = {
            id: id,
            type: 'mpg_league',
            adminId: adminId,
            name: name,
            description: description,
        }

        const result = await this.leagueController.insert(id, league)
        return result
    }

    /**
     * Retrieves users from a league
     * @param {QueryOptions} options - The query options
     * @returns {Promise<any>} A promise that resolves to the result of the users retrieval
     */
    public async toGetUsersFromLeague(options: QueryOptions ) : Promise<any> {

        // Query users with leagueId 
        const query = `SELECT usersTeams FROM \`mpg\` WHERE id = $leagueId AND type = \"mpg_league\"`

        const result = await this.leagueController.query(query, options)
        return result

    }

    /**
     * Retrieves a team by its ID
     * @param {string} teamId - The ID of the team
     * @returns {Promise<any>} A promise that resolves to the result of the team retrieval
     */
    public async toGetTeam(teamId: string) : Promise<any> {

        const result = await this.leagueController.get(teamId)
        return result

    }

    /**
     * Updates a team with the provided ID and updated document
     * @param {string} teamId - The ID of the team
     * @param {any} updatedDocument - The updated document for the team
     * @returns {Promise<any>} A promise that resolves to the result of the team update
     */
    public async toUpdateTeam(teamId: string, updatedDocument: any) : Promise<any> {

        await this.leagueController.replace(teamId, updatedDocument)

    }

}

export default LeagueService