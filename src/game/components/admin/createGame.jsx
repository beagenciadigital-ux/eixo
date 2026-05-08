import { Container, Title, Text, Stack, Button } from "@mantine/core"
import { useEffect, useState } from "react"
// import { UseForm } from "@mantine/form/lib/types"
import { useSelector, useDispatch } from "react-redux"
import { fetchGames, setActiveGame } from "../../store/gamesSlice"
import Axios from 'axios'
import { useNavigate } from "react-router-dom"

function CreateGame()
{

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const games = useSelector(state => state.games.games)
    const activeGame = useSelector(state => state.games.activeGame)

    useEffect(() =>
    {
        if (activeGame === null) {
            dispatch(setActiveGame(games[0]))
        }
    }, [])

    // use keys from activeGame to create form fields
    // duplicate the object and remove certain fields first
    const exclude = ['game_id', 'created_at', 'updated_at', 'uuid', 'id', 'lastTurnsUpdate', 'lastAidUpdate', 'numEmpires', 'avgLand', 'avgNetWorth']

    const activeGameCopy = { ...activeGame }
    for (const field of exclude) {
        delete activeGameCopy[field];
    }

    const [details, setDetails] = useState(activeGameCopy)

    const fields = Object.keys(activeGameCopy)
    const values = Object.values(activeGameCopy)

    const handleChange = (e) =>
    {
        // console.log(e)
        let { name, value, type, checked } = e.target
        // console.log(name, value, type, checked)
        if (type === "number") {
            value = Number(value);
        } else if (type === "checkbox") {
            value = checked;
        }
        setDetails((details) => ({ ...details, [name]: value }))
    }

    const handleSubmit = async (e) =>
    {
        e.preventDefault()
        // console.log(details)
        const res = await Axios.post('/admin/creategame', details)
        const data = res.data
        console.log(data)
        dispatch(fetchGames())
        navigate('/admin/')
    }

    return (
        <Container>
            <Title>Create A Game</Title>
            <form onSubmit={handleSubmit}>
                <Stack spacing='xs'>
                    {fields.map((field, index) =>
                    {
                        let type = typeof values[index]
                        if (type === 'boolean') {
                            type = 'checkbox'
                        }

                        return (
                            <label key={index}><Text>{field} - {String(values[index])}</Text>
                                <input type={type} onChange={handleChange} name={field} checked={details[field]} placeholder={values[index]} />
                            </label>
                        )
                    })}
                    <Button type="submit">Create Game</Button>
                </Stack>
            </form>
        </Container>
    )
}

export default CreateGame