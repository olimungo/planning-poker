import './pigs-list.css';
import firebase from 'firebase/app';
import 'firebase/database';
import { Badge } from '..';

type Props = { pigsRef: firebase.database.Reference[], scrumMasterRef: firebase.database.Reference, onClick: Function };

export function PigsList(props: Props) {
    const { pigsRef, scrumMasterRef, onClick } = props;

    return (
        <div className="pigs-list">
            {
                pigsRef.map(pig => <Badge key={pig.key} reference={pig} scrumMasterRef={scrumMasterRef} />)
            }
        </div>
    );
};