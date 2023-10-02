import axios from "axios"
import { GetQuestion } from "../types"


export async function getQuestions(roomId: string) {
    const response =  await axios.get<GetQuestion[]>(`http://localhost:9000/room/${roomId}/questions`)
    if (response){
        console.log(response)
    return response.data
    }
    return [] as GetQuestion[]
}