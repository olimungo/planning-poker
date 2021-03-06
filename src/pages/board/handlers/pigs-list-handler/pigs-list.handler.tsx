import './pigs-list.handler.css';
import { Badge } from '../../../../components';
import { useContext, useEffect, useState } from 'react';
import { AppContext, PigListType } from '../../../common';
import { RemovePigForm } from './remove-pig-form';
import { removePig } from '../../../services';

type Props = { showVote?: boolean, isClickable?: boolean, };

export function PigsListHandler(props: Props) {
    const { showVote = false, isClickable = false } = props;
    const appContext = useContext(AppContext);
    const [pigs, setPigs] = useState<PigListType[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [pigToRemove, setPigToRemove] = useState<{ key: string, name: string } | null>(null);
    const [pigToRemoveConfirmed, setPigToRemoveConfirmed] = useState(false);

    // Watch when pigs register and update the display
    useEffect(() => {
        if (appContext.pigs) {
            const pigs: PigListType[] = [];

            for (let key in appContext.pigs) {
                const dateCreated = appContext.pigs[key].dateCreated;
                const name = appContext.pigs[key].name;
                const email = appContext.pigs[key].email;
                const isScrumMaster = appContext.pigs[key].isScrumMaster;
                const vote = appContext.pigs[key].vote;
                pigs.push({ key, dateCreated, name, email, isScrumMaster, vote });
            }

            setPigs(pigs);
        }
    }, [appContext.pigs]);

    useEffect(() => {
        if (pigToRemoveConfirmed && appContext.boardKey && pigToRemove) {
            setPigToRemoveConfirmed(false);
            removePig(appContext.boardKey, pigToRemove.key);
        }
    }, [appContext.boardKey, pigToRemoveConfirmed, pigToRemove]);

    const confirmRemove = (key: string, name: string) => {
        setPigToRemove({ key, name });
        setShowForm(!showForm);
    };

    const removeConfirmed = () => {
        setPigToRemoveConfirmed(true);
        setShowForm(false);
    };

    return (
        <div className="pigs-list">
            {
                pigs.map(pig =>
                    <div key={pig.key} onClick={() => confirmRemove(pig.key, pig.name || '')}>
                        <Badge key={pig.key} name={pig.name} email={pig.email} vote={pig.vote} displayStar={pig.isScrumMaster} showVote={showVote}
                            isClickable={isClickable} theme={appContext.theme} />
                    </div>
                )
            }

            {
                showForm ? <RemovePigForm name={pigToRemove?.name || ''} onOk={removeConfirmed} onCancel={() => setShowForm(false)} /> : ''
            }
        </div>
    );
};