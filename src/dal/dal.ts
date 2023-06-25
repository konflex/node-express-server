/**
 * @file src/dal/dal.ts
 * @summary Data Access Layer for interacting with the Couchbase database
 * @module DAL
*/

import {
    Bucket, 
    Cluster,
    Collection,
    connect,
  } from 'couchbase'


class DAL {

    private cluster!: Cluster
    private bucket!: Bucket
    private collection!: Collection

    private clusterConnStr = 'couchbase://localhost'
    private username = 'USERNAME'
    private password = 'PWD'
    private bucketName = 'BUCKET_NAME'


    /**
     * Constructs a new instance of the DAL class and connects to the Couchbase cluster and bucket
     */
    constructor() {
        this.connectToCluster()
        .then(() => this.connectToBucket())
        .catch((err) => {
            console.error('Failed to connect to the cluster: ', err)
            process.exit(1)
        })
    }

    /**
     * Connects to the Couchbase cluster
     * @returns A promise that resolves to the connected cluster
     */
    public async connectToCluster() {
        this.cluster = await connect(this.clusterConnStr, {
            username: this.username,
            password: this.password,
        }) 
    }

    /**
     * Connects to the specified bucket in the cluster
     */
    public connectToBucket() {
        this.bucket = this.cluster.bucket(this.bucketName)
        this.collection = this.bucket.defaultCollection()
    }  

    /**
     * Returns the Couchbase collection object
     * @returns The Couchbase collection object
     */
    public getCollection(): Collection {
        return this.collection
    }

    /**
     * Returns the Couchbase cluster object
     * @returns The Couchbase cluster object
     */
    public getCluster(): Cluster {
        return this.cluster
    }

}

export default DAL