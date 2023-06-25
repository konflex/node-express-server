/**
 * @file src/services/leagueController.ts
 * @summary Controller for handling league-related operations
 * @module LeagueController
 */

import { 
    Collection, 
    Cluster, 
    QueryResult, 
    QueryOptions,
} from "couchbase"
import LeagueService from './services.js'
import { Request, Response,} from 'express'

interface CreateLeagueRequest {
    id: string;
    name: string;
    description: string;
    adminId:string;
}

interface UpdateTeamNameReq {
    name: string;
}

interface UpdateTeamNameParams {
    teamId: string;
}

/**
 * Represents the LeagueController class responsible for handling league-related operations
 */
class LeagueController {
    private collection : Collection
    private cluster : Cluster

    /**
     * Constructs an instance of the LeagueController class
     * @param {Collection} collection - The Couchbase collection instance
     * @param {Cluster} cluster - The Couchbase cluster instance
     */
    constructor(collection : Collection, cluster: Cluster) {
        this.collection = collection
        this.cluster = cluster
    }

    /**
     * Inserts a document into the collection
     * @param {string} id - The ID of the document 
     * @param {any} data - The data to be inserted
     * @returns {Promise<any>} A promise that resolves to the result of the instance operation
     */
    public async insert(id: string, data: any) : Promise<any> {
        // Insert document into the collection
        const result = await this.collection.insert(id,data)

        return result
    }

    /**
     * Retrieves a document from the collection based on the provided key
     * @param {string} key - The key of the document to retrieve 
     * @returns {Promise<any>} A promise that resolves to the retrieved document 
     */
    public async get(key: string) : Promise<any> {
        // Find the team document based on teamId
        const result = await this.collection.get(key)

        return result
    }

    /**
     * Replaces a document in the collection based on the provided key
     * @param {string} key - The key of the document to replace 
     * @param {any} updatedDocument - The updated document to repalce with 
     * @returns {Promise<any>} A promise that resolves once the document is replaced
     */
    public async replace(key: string, updatedDocument: any) : Promise<any> {
        // Update a document based on key
        await this.collection.replace(key, updatedDocument)
        
    }

    /**
     * Executes a query on the cluster
     * @param {string} query - The N1QL query string
     * @param {QueryOptions} options - The options for the query 
     * @returns {Promise<any>} A promise that resolves to the query result
     */
    public async query(query: string, options: QueryOptions) : Promise<any> {
        // Query documents from cluster
        const result: QueryResult = await this.cluster.query(query, options)

        return result
    }

    /**
     * Creates a new league
     * @param {LeagueService} leagueService - The league service instance
     * @returns {Function} An Express request handler function for creating a new league
     */
    public createLeague(leagueService: LeagueService) {
        return async (req: Request<{}, {}, CreateLeagueRequest>, res: Response) => {
            try {
    
                if(!req.body) return res.status(400).json({ error: 'Request body is missing'})
    
                const { id, name, description, adminId, } = req.body
    
                if(!(id || name || description || adminId)) {
                    return res.status(400).json({ error: 'Missing required properties', })
                }

                if( typeof id !== 'string' || typeof name !== 'string' || typeof description !== 'string' || typeof adminId !== 'string') {
                    return res.status(400).json({ error: 'Invalid data type for properties', })
                }
    
                // // Call the LeagueService to create a new league
                const result = await leagueService.toCreateLeague(id, name, description, adminId)
    
                res.json(result)
            }
            catch(err) {
                console.log('Error occured while creating league:', err)
                return res.status(500).json({ error: 'An error occured whild creating the league', })
            }
        
        }
    }

    /**
     * Retrieves users from a league
     * @param {LeagueService} leagueService - The league service instance
     * @returns {Function} An Express request handler function for retrieving users from a league 
     */
    public getUsersFromLeague(leagueService: LeagueService) {
        return async (req: Request, res: Response) => {
    
            try {
    
              if(!req || !req.params || !req.params.leagueId) return res.status(400).json({ error: 'Request params is missing' ,})

              // leagueId from params
              const leagueId: string = req.params.leagueId
    
              const options: QueryOptions = {
                parameters: {
                  leagueId: leagueId,
                }
              }
              
              const result: QueryResult = await leagueService.toGetUsersFromLeague(options)
              
              if(result.rows && 
                result.rows[0] && 
                Object.keys(result.rows[0]).length > 0
              ) {
    
                const userTeams = result.rows.map((row) => row.usersTeams).flat()
                const users = Object.values(userTeams[0]).map(name => ({ name }))
    
                return res.status(200).json({ users })
              }
              else {
                return res.status(204).json({ users: [] })
              }
            }
            catch(err: any) {
                console.log('Error occured while retrieving users from a league:', err)
                return res.status(500).json({ error: 'Error occured while retrieving users from a league'})
            }
          }
    }
    
    /**
     * Updates the name of a team
     * @param {LeagueService} leagueService - The league service instance
     * @returns {Function} An Express request handler function for updating the name of a team
     */
    public updateTeamName(leagueService: LeagueService) {
        return async (req: Request<UpdateTeamNameParams, {}, UpdateTeamNameReq>, res: Response) => {
    
            try {
     
                if(!req.body || !req.params) return res.status(400).json({ error: 'Request body or request params is undefined'})

                const { teamId } = req.params
                const { name } = req.body
              
                if(! teamId || !name) {
                    return res.status(400).json({ error: 'teamId and name are required', })
                }

                if( typeof teamId !== 'string' || typeof name !== 'string') {
                    return res.status(400).json({ error: 'Invalid data type for properties', })
                }

                // Find the team document based on teamId
                const result = await leagueService.toGetTeam(teamId)
                  
                if(!result || !result.content) {
                  return res.status(404).json({ error: 'Team not found', })
                }
      
                const team = result.content
      
                // Update the team name
                team.name = name
      
                // Replace the updated team document in Couchbase
                await leagueService.toUpdateTeam(teamId, team)
                
                // Return a success response
                return res.status(200).json({ message: 'Team name updated successfully', })
      
            }
            catch(err) {
                // Error occured while updating team
                console.log('An error occured while updating team: ', err)
                return res.status(500).json({ error: 'An error occured while updating team', })
            }
        }
    }

}

export default LeagueController