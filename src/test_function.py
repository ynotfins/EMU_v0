def print_function_name() -> None:
    """Print the name of this function when called."""
    print(print_function_name.__name__)


if __name__ == "__main__":
    print_function_name()

