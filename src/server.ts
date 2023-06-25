/**
 * @file src/server.ts
 * @summary The server main component
 * @module Main
*/

import express from 'express'
import routes from './routes/routes.js'
import DAL from './dal/dal.js'
import LeagueService from './services/services.js'
import LeagueController from './services/leagueController.js'
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'

const app = express()
const port = 3000

// Start server
const server = app.listen(port, () => {
    console.log(`Now listening on port ${port}`)
})

/**
 * Event listener for unhandled primise rejections
 * @param {Error} err - The unhandled error object
 */
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection: ',err)
		// Close server gracefully and exit the process
    server.close(() => {
      process.exit(1)
    })
})


/**
 * The main function that sets up the server and starts it.
 */
async function main() {
    try {

      // Create a new DAL instance
      const dal = new DAL()
      // Connect to the Couchbase cluster
      await dal.connectToCluster()
      // Connect to the bucket
      dal.connectToBucket()
      // Get the collection and cluster instances
			const collection = dal.getCollection()
      const cluster = dal.getCluster()
      // Create a new leagueController instance and new leagueService instance
      const leagueController = new LeagueController(collection, cluster)
      const leagueService = new LeagueService(leagueController)

      app.use(cors())
      app.use(express.json())
			app.use(express.urlencoded({ extended: true, }))

      // Create the router with the leagueService and leagueController instances
      const router = routes(leagueService, leagueController)

      app.use('/apiDocs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

      // Use the router for handling routes
      app.use('/', router)

			// Main route
      app.get("/", (req, res) => {{
        res.send(

          `<h1>API for managing leagues</h1>
          An API for managing leagues with Couchbase Server and the Node.js SDK.
          <ul>
            <li><a href="/apidocs">Learn the API with Swagger, interactively</a>
          </ul>`

        )
      }})
    
      // Start the server and wait until it's listening
			console.log('Express server has started')
			await new Promise((resolve) => server.once('listening', resolve))

    } 
		catch (err) {
      console.error('Error is: ', err);
      server.close(() => {
        process.exit(1);
      });
    }
}

// Call the main function to start the server
main()