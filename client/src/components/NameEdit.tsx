interface INameEditProps{
    name : string;
}
function NameEdit({name}:INameEditProps){
    return(
        <div>
            Name : {name}
        </div>
    );
}
export default NameEdit;