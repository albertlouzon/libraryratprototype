import axios from "axios";

function TestImg() {
    return <form>
        <label>
            <input onChange={selectFilePlease} type="file" accept=".csv" name="name" />
        </label>
    </form>
}

const selectFilePlease = async function (e) {
    if(!e.target.files || e.target.files.length === 0) {
        console.log('no files selected')
        return
    }
    const csv = e.target.files[0]
    const formData = new FormData()
    formData.append(csv.fileName, csv);

    try {
        const config = {
            headers: { 'content-type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
            },
        };

        const res = await axios.post(`/api/dailyUsers`, csv);
        console.log('from server with love', res)
    } catch (e) {
        console.error(e);
    }
}

export default TestImg
