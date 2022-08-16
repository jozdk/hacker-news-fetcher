import { useEffect, useRef } from "react";
import {
    StyledSearchForm,
    StyledButtonLarge,
    StyledLabel,
    StyledInput,
    StyledCheckboxContainer,
    StyledCheckmark
} from "../StyledComponents";

export const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit, onCheckboxChange }) => {
    return (
        <StyledSearchForm onSubmit={onSearchSubmit}>
            <InputWithLabel
                id="search"
                value={searchTerm}
                isFocused
                onInputChange={onSearchInput}
            >
                <strong>Search:</strong>
            </InputWithLabel>

            <StyledButtonLarge type="submit" disabled={!searchTerm}>
                Submit
            </StyledButtonLarge>
            <Checkbox label="Latest" onInputChange={onCheckboxChange} />
        </StyledSearchForm>
    )
}

const InputWithLabel = ({ id, value, type = "text", onInputChange, isFocused, children }) => {
    const inputRef = useRef();

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <>
            <StyledLabel htmlFor={id}>{children}</StyledLabel>
            &nbsp;
            <StyledInput
                ref={inputRef}
                type={type}
                id={id}
                value={value}
                autoFocus
                onChange={onInputChange}
            />
        </>

    );
};

const Checkbox = ({ label, onInputChange }) => {
    return (
        <StyledCheckboxContainer>{label}
            <input type="checkbox" onClick={onInputChange} />
            <StyledCheckmark></StyledCheckmark>
        </StyledCheckboxContainer>
    );
}