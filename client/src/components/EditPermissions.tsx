interface IEditPermissionsProp{
    boardId: string;
    userId: string;
    canEdit:boolean;
}
function EditPermissions({boardId, userId, canEdit}:IEditPermissionsProp){
    return (
        <div>{boardId}</div>
    );
}
export default EditPermissions;