import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex';

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
});

app.get('/ping', async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: 'Pong!'})
    }catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Erro inesperado!')
        }
    }
})

app.post('/create-table-bands', async (req: Request, res: Response) => {
    try{
        await db.raw(`
            CREATE TABLE bands (
                id TEXT PRIMARY KEY UNIQUE NOT NULL,
                name TEXT NOT NULL
            );
            `)
        
        res.status(200).send('Tabela criada com sucesso!');
    }catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Erro inesperado!')
        }
    }
});

app.get('/bands', async (req: Request, res: Response) => {
    try {
        const result =  await db.raw(`
            SELECT * FROM bands;
        `)

        res.status(200).send(result)

    }catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Erro inesperado!')
        }
    }
});

app.post('/bands', async (req: Request, res: Response) => {
    try {
        const id = req.body.id;
        const name = req.body.name;

        if (!id || !name){
            res.status(400)
            throw new Error("Dados inválidos!")
        }

        await db.raw(`
            INSERT INTO bands (id, name)
            VALUES ("${id}", "${name}");
        `)

        res.status(200).send('Usuário cadastrado com sucesso!')
    } catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Erro inesperado!')
        }
    }
})

app.delete('/bands/:id', async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id;

        const [ band ] = await db.raw(`
            SELECT * FROM bands
            WHERE id = "${idToDelete}";
        `)

        if (!band) {
            res.status(404)
            throw new Error("Id não encontrado!")
        }

        await db.raw(`
            DELETE FROM bands
            WHERE id = "${idToDelete}";
        `)

        res.status(200).send({message: "Banda deletada com sucesso!"})


    } catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Erro inesperado!')
        }
    }
})

app.put("/bands/:id", async (req: Request, res: Response) => {
    try{
        const id = req.params.id;
        const newId = req.body.id;
        const newName = req.body.name;

        if (newId !== undefined) {
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error ("'Id' deve ser uma string")
            }

            if (newId.length < 2) {
                res.status(400)
                throw new Error ("'Id' deve possuir no mínimo 2 caracteres")
            }

            if (newId[0] !== 'b') {
                res.status(400)
                throw new Error("'id' deve possuir iniciar com a letra b")
            }
        }

        if (newName !== undefined) {
            if (typeof newName !== "string") {
                res.status(400)
                throw new Error ("'Name' deve ser uma string")
            }

            if (newName.length < 2) {
                res.status(400)
                throw new Error ("'Name' deve possuir no mínimo 2 caracteres")
            }
        }

        const [ band ] = await db.raw(`
            SELECT * FROM bands
            WHERE id = "${id}";
        `)

        if ( band ) {
            await db.raw(`
                UPDATE bands
                SET
                    id = "${newId || id}",
                    name = "${newName || band.name}"
                WHERE id = "${id}"
            `)
        } else {
            res.status(404)
            throw new Error("'Id' não encontrada!")
        }

        res.status(200).send({message: "Atualização realizada com sucesso!"})
    } catch(error){
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send('Erro inesperado!')
        }
    }
});