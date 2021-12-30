import AWS from 'aws-sdk'
import fs from 'fs'
import { isEmpty } from 'class-validator'
import { decrypt, encrypt } from './services/functions.service'

export const IS_LOCAL: boolean = Boolean(process.env.IS_LOCAL)
export const NODE_ENV: string = process.env.NODE_ENV.trim().toUpperCase()

const NAME = "MUNDOFIT_"
const SSM = new AWS.SSM({ region: 'us-west-2' })

export async function getEnvironmentParam(name: string, notFoundName: string = name) {
    name = name.trim().toUpperCase()
    notFoundName = notFoundName.trim().toUpperCase()
    if (name == "DB_NAME") {
        return "prueba_indra"
    }
    let params: any = {
        APP_KEY: process.env.APP_KEY,
        JWT_KEY: process.env.JWT_KEY,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: "prueba_indra",
    }
    if (IS_LOCAL) {
        try {
            params = getEnvVariables()
        } catch (error) {
            console.log(error)
        }
    }
    if (isEmpty(params[name])) {
        return await getSSMParam(NAME + notFoundName, name)
    }
    return params[name]
}

function getEnvVariables() {
    const file = fs.readFileSync(".env", { encoding: "utf8" })
    let params = {}
    if (file) {
        const vars = file.split(/\r\n|\n/).map(value => { return value.split(" = ") })
        vars.forEach(element => {
            if (element[0] && element[1]) params[element[0].trim()] = decrypt(element[1].trim())
        });
    }
    return params
}

async function getSSMParam(Name: string, envName: string) {
    console.debug("Consultando SSM:", `'${Name}'`)
    const result = await SSM.getParameter({ Name }, (err, data) => { return { err, data } }).promise()
    if (result.Parameter.Value) {
        try {
            const params = getEnvVariables()
            if (isEmpty(params)) {
                fs.appendFileSync(".env", `${envName} = ${encrypt(result.Parameter.Value)}`)
            } else if (!Object.prototype.hasOwnProperty.call(params, envName)) {
                fs.appendFileSync(".env", `\n${envName} = ${encrypt(result.Parameter.Value)}`)
            }
        } catch (error) {
            console.error("El archivo .env no existe, se creará", error)
            fs.appendFileSync(".env", `${envName} = ${encrypt(result.Parameter.Value)}`)
        }
        return result.Parameter.Value
    }
    console.error(result.$response.error)
    throw new Error(`No se encontró el parametro SSM '${Name}'`);

}

export const environment = {
    name: NODE_ENV + (IS_LOCAL ? "_local" : ""),
    app_port: 3000,
    secret_key: "!#,adhjd!#;asd67,q;2evk,abda$!#$#$",
    db: {
        logs: true,
    }
}