import { forwardRef } from 'react';

interface INameEditProps{
    name : string;
    defaultValue? : string;
    onUpdate? : () => void;
}

const NameEdit = forwardRef<HTMLDivElement, INameEditProps>(({name, defaultValue, onUpdate}:INameEditProps, ref) => {
    return (
        <>
        <div ref={ref}>
            Name : {name ? name : defaultValue}
        </div>
        </>
    );
});

export default NameEdit;