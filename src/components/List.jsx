import { useState } from "react";
import { sortBy } from "lodash";
import {
    StyledList,
    StyledHeadItem,
    StyledItem,
    StyledColumn,
    StyledButtonSmall
} from "../StyledComponents";
import { IconChevron } from "./icons/IconChevron.jsx";

const SORTS = {
    NONE: (list) => list,
    TITLE: (list) => sortBy(list, "title"),
    AUTHOR: (list) => sortBy(list, "author"),
    COMMENT: (list) => sortBy(list, "num_comments").reverse(),
    POINT: (list) => sortBy(list, "points").reverse(),
    CREATED_AT: (list) => sortBy(list, "created_at").reverse()
};

export const List = ({ list, onRemoveItem }) => {
    const [sort, setSort] = useState({
        sortKey: "NONE",
        isReverse: false
    });

    const handleSort = (sortKey) => {
        const isReverse = sort.sortKey === sortKey && !sort.isReverse;
        setSort({
            sortKey,
            isReverse
        });
    }

    const sortFunction = SORTS[sort.sortKey];
    const sortedList = sort.isReverse
        ? sortFunction(list).reverse()
        : sortFunction(list);

    return (
        <StyledList>
            <ListHead sort={sort} handleSort={handleSort} />
            {sortedList.map((item) => (
                <Item
                    key={item.objectID}
                    item={item}
                    onRemoveItem={onRemoveItem}
                />
            ))}
        </StyledList>
    )
};

const ListHead = ({ sort, handleSort }) => {
    return (
        <StyledHeadItem>
            <StyledColumn width="40%">
                Title
                <IconChevron sort={sort} column="TITLE" handleSort={handleSort} />
            </StyledColumn>
            <StyledColumn width="20%">
                Author
                <IconChevron sort={sort} column="AUTHOR" handleSort={handleSort} />
            </StyledColumn>
            <StyledColumn width="10%">
                Comments
                <IconChevron sort={sort} column="COMMENT" handleSort={handleSort} />
            </StyledColumn>
            <StyledColumn width="10%">
                Points
                <IconChevron sort={sort} column="POINT" handleSort={handleSort} />
            </StyledColumn>
            <StyledColumn width="10%">
                Date
                <IconChevron sort={sort} column="CREATED_AT" handleSort={handleSort} />
            </StyledColumn>
            <StyledColumn width="10%">
                Action
            </StyledColumn>
        </StyledHeadItem>
    )
}

const Item = ({ item, onRemoveItem }) => {
    return (
        <StyledItem>
            <StyledColumn width="40%">
                <a href={item.url}>{item.title}</a>
            </StyledColumn>
            <StyledColumn width="20%">{item.author}</StyledColumn>
            <StyledColumn width="10%">{item.num_comments}</StyledColumn>
            <StyledColumn width="10%">{item.points}</StyledColumn>
            <StyledColumn width="10%">{new Date(item.created_at).toLocaleDateString("fr")}</StyledColumn>
            <StyledColumn width="10%">
                <StyledButtonSmall type="button" onClick={() => onRemoveItem(item)}>
                    Dismiss
                </StyledButtonSmall>
            </StyledColumn>
        </StyledItem>
    );
}