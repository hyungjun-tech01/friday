import Header from "./Header";
function Fix({setCurrent, projectName}:any){
    return(
        <div>
            <Header setCurrent={setCurrent} projectName={projectName}/>
        </div>
    )
}

export default Fix;