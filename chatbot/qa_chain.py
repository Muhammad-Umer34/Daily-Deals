from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from setup import vectorstore, llm

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

retrieval_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=False
)

summary_prompt = PromptTemplate.from_template("""
You are a friendly Daily Deals chatbot.
Make the answer short and simple.Also write the text in a way like how modern chatbot respond.You are a Daily Deals own chatbot so behave like that.

Answer: {answer}

Simple Reply:
""")

summary_chain = summary_prompt | llm | StrOutputParser()
