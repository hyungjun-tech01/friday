interface IEditPermissionsProp{
    boardId: string;
    userId: string;
    canEdit:string;
}
function EditPermissions({boardId, userId, canEdit}:IEditPermissionsProp){
    return (
        <div>{boardId}</div>
    );
}
export default EditPermissions;