import { StyledLastSearchesContainer, StyledButtonSmall } from "../StyledComponents";

export const LastSearches = ({ lastSearches, onLastSearch }) => {
    return (
        <StyledLastSearchesContainer>
            {lastSearches.map((searchRequest, index) => {
                return (
                    <StyledButtonSmall
                        key={searchRequest + index}
                        onClick={() => onLastSearch(searchRequest)}
                        marginRight={true}
                    >
                        {searchRequest}
                    </StyledButtonSmall>
                );
            })}
        </StyledLastSearchesContainer>
    )
}